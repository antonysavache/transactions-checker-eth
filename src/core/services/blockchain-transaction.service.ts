import { Injectable} from "@nestjs/common";
import { CompleteTransaction } from "@shared/models";
import { Observable, tap } from "rxjs";
import { EthereumBlockchainDataProvider } from "@core/providers/eth/eth-blockchain-data.provider";
import { Repository } from "@shared/repository";

@Injectable()
export class BlockchainTransaction {
    constructor(
        private ethDataProvider: EthereumBlockchainDataProvider,
        private repository: Repository
    ) {}

    getTransactions(wallets: string[], intervalHours: number = 24): Observable<CompleteTransaction[]> {
        return this.ethDataProvider.fetch(wallets, intervalHours).pipe(
            tap(transactions => {
                // Создаем карту для подсчета транзакций по кошелькам
                const walletTransactionCounts = new Map<string, number>();
                
                // Подсчитываем транзакции для каждого кошелька
                wallets.forEach(wallet => {
                    const normalizedWallet = wallet.toLowerCase();
                    let count = 0;
                    
                    // Считаем все транзакции, где кошелек является отправителем или получателем
                    transactions.forEach(tx => {
                        const sender = tx.walletSender.toLowerCase();
                        const receiver = tx.walletReceiver.toLowerCase();
                        
                        if (sender === normalizedWallet || receiver === normalizedWallet) {
                            count++;
                        }
                    });
                    
                    // Сохраняем количество для этого кошелька
                    walletTransactionCounts.set(normalizedWallet, count);
                });
                
                // Логируем результаты для каждого кошелька
                wallets.forEach(wallet => {
                    const normalizedWallet = wallet.toLowerCase();
                    const count = walletTransactionCounts.get(normalizedWallet) || 0;
                    
                    // Создаем сообщение лога с количеством транзакций
                    const logMessage = `Successfully fetched ${count} total transactions for wallet ${wallet}`;
                    console.log(logMessage);
                    
                    // Сохраняем лог в Google Sheets
                    this.repository.saveLog(logMessage);
                });
            })
        );
    }
}