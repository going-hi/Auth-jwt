import { UserDto } from "../../auth/dto/user.dto";
import express from 'express';



declare global {
  namespace Express {
    export interface Request {
      user: UserDto
    }
  }
}

export {}