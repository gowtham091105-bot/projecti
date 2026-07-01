import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
