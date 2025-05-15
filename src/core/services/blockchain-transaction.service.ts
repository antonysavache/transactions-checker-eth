import { Injectable} from "@nestjs/common";
import { CompleteTransaction } from "@shared/models";
import { Observable } from "rxjs";
import { EthereumBlockchainDataProvider } from "@core/providers/eth/eth-blockchain-data.provider";

@Injectable()
export class BlockchainTransaction {
    constructor(
        private ethDataProvider: EthereumBlockchainDataProvider,
    ) {}

    getTransactions(wallets: string[], intervalHours: number = 24,): Observable<CompleteTransaction[]> {
        return this.ethDataProvider.fetch(wallets, intervalHours)
    }
}