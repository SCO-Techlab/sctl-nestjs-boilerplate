import { Module } from "@nestjs/common";
import { BcryptService } from "@shared/services";

const SERVICES = [
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
