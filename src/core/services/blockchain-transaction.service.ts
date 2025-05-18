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
                // Группируем транзакции по кошелькам
                const walletTransactions = new Map<string, number>();
                
                // Считаем транзакции для каждого кошелька
                transactions.forEach(tx => {
                    // Учитываем как входящие, так и исходящие транзакции
                    if (wallets.includes(tx.walletSender)) {
                        walletTransactions.set(
                            tx.walletSender, 
                            (walletTransactions.get(tx.walletSender) || 0) + 1
                        );
                    }
                    
                    if (wallets.includes(tx.walletReceiver)) {
                        walletTransactions.set(
                            tx.walletReceiver, 
                            (walletTransactions.get(tx.walletReceiver) || 0) + 1
                        );
                    }
                });
                
                // Логируем количество транзакций для каждого кошелька
                wallets.forEach(wallet => {
                    const count = walletTransactions.get(wallet) || 0;
                    const logMessage = `Successfully fetched ${count} total transactions for wallet ${wallet}`;
                    console.log(logMessage);
                    this.repository.saveLog(logMessage);
                });
            })
        );
    }
}