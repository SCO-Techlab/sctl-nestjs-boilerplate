import { Module } from "@nestjs/common";
import { BcryptService, PaginationService, SendTemplatesService } from "@shared/services";

const SERVICES = [
  BcryptService,
  PaginationService,
  SendTemplatesService,
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
