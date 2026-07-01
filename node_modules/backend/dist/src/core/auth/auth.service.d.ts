import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(userId: string): Promise<{
        success: boolean;
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            tenantId: string;
            tenantName: string;
        };
    }>;
}
