import { PaginationService } from "@core/shared/services";
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
