import { Module } from "@nestjs/common";
import { BcryptService, PaginationService } from "@shared/services";

const SERVICES = [
  BcryptService,
  PaginationService,
];

@Module({
  providers: [
    ...SERVICES
  ],
  exports: [
    ...SERVICES
  ]
})
export class SharedModule { }
