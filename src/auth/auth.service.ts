import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import * as argon from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hashedPassword = await argon.hash(dto.password);

    try {
      // create user record in database
      const user = await this.prisma.users.create({
        data: {
          hashedPassword,
          email: dto.email,
        },
      });

      return user;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new ConflictException("User with this email already exists");
        }
      }

      throw e;
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException("Invalid credentials email");
    }

    const isPasswordValid = await argon.verify(
      user.hashedPassword,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException("Invalid credentials password");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      access_token: await this.signToken({
        email: user.email,
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      }),
    };
  }

  signToken(user: {
    email: string;
    id: number;
    firstName: string;
    lastName: string;
  }) {
    const payload = {
      email: user.email,
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return this.jwt.signAsync(payload, {
      secret: this.config.get("JWT_SECRET"),
      expiresIn: "7d",
    });
  }
}
