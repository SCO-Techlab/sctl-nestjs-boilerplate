import { Module } from "@nestjs/common";
import { BcryptService, TemplatesService } from "@shared/services";

const SERVICES = [
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
