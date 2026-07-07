import { createUser, findUserByEmail, findUserByEmailByPassword } from "../dao/user.dao.ts";
import { ConflictError } from "../utils/errorHandler.ts";
import { signToken } from "../utils/helper.ts";

export const registerUser = async (name: string, email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (user) throw new ConflictError("User already exists");

    const newUser = await createUser(name, email, password);
    const token = await signToken({ id: newUser._id });
    return { token, user: newUser };
};

export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmailByPassword(email);
    if (!user) throw new Error("Invalid email or password");

    const isPasswordValid = await (user as any).comparePassword(password);
    if (!isPasswordValid) throw new Error("Invalid email or password");

    const token = await signToken({ id: user._id });
    return { token, user };
};
