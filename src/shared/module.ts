import { PaginationService } from "@core/pagination";
import { Module } from "@nestjs/common";
import { BcryptService, TemplatesService } from "@shared/services";

const SERVICES = [
  PaginationService,
  BcryptService,
  TemplatesService,
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
