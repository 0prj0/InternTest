import { auth } from './lib/auth';
import { UserRepository } from '../../packages/repositories';
import { AuthService, UserService } from '../../packages/services'; //, UserService

const userRepository = new UserRepository();

const authService = new AuthService(auth, userRepository);
const userService = new UserService(auth, userRepository);

export { authService, userService }; //, userService