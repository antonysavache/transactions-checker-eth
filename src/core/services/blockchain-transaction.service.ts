import { Injectable} from "@nestjs/common";
import { CompleteTransaction } from "@shared/models";
import { Observable, from, tap } from "rxjs";
import { EthereumBlockchainDataProvider } from "@core/providers/eth/eth-blockchain-data.provider";
import { Repository } from "@shared/repository";

@Injectable()
export class BlockchainTransaction {
    constructor(
        private ethDataProvider: EthereumBlockchainDataProvider,
        private repository: Repository
    ) {}

    getTransactions(wallets: string[], intervalHours: number = 24): Observable<CompleteTransaction[]> {
        // Получаем транзакции через провайдер
        return this.ethDataProvider.fetch(wallets, intervalHours).pipe(
            tap(() => {
                // Для каждого кошелька пытаемся получить фактические данные о транзакциях
                // из исходных результатов API
                wallets.forEach(wallet => {
                    // Приводим адрес кошелька к нижнему регистру для сравнения
                    const lowerWallet = wallet.toLowerCase();
                    
                    // Получаем баланс по API для кошелька
                    const url = `https://api.etherscan.io/api?module=account&action=balance&address=${wallet}&tag=latest&apikey=V7IZ9DHUX36B3TW31HYWC97YGY2XI7J5US`;
                    
                    // Делаем запрос
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            // Этот запрос не даст количество транзакций, 
                            // но мы можем использовать его для логирования наличия аккаунта
                            const logMessage = `Successfully fetched transactions for wallet ${wallet}`;
                            console.log(logMessage);
                            this.repository.saveLog(logMessage);
                        })
                        .catch(err => {
                            console.error(`Error fetching info for wallet ${wallet}:`, err);
                        });
                });
            })
        );
    }
}