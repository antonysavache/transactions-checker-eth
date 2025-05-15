import {Module, OnModuleInit} from "@nestjs/common";
import {Repository} from "@shared/repository";
import {BlockchainTransaction} from "@core/services/blockchain-transaction.service";
import {MonitorService} from "@core/services/monitor-service";
import { SharedModule } from "@shared/shared.module";
import {MockBlockchainDataProvider} from "@core/providers/mock/blockchain-data.provider";
import {EthereumBlockchainDataProvider} from "@core/providers/eth/eth-blockchain-data.provider";

@Module({
  imports: [SharedModule],
  providers: [
    Repository, 
    BlockchainTransaction,
    MonitorService,
    MockBlockchainDataProvider,
    EthereumBlockchainDataProvider
  ],
  exports: [MonitorService]
})
export class MonitorModule implements OnModuleInit {
  onModuleInit() {
    console.log('MonitorModule initialized');
  }
}