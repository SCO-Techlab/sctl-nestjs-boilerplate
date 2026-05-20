import { PaginationService } from "@core/shared/services";
import { Module } from "@nestjs/common";
import { BcryptService } from "@shared/services";

const SERVICES = [
  PaginationService,
  BcryptService,
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
