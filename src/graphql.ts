
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface CreateUserInput {
    createdAt?: Nullable<DateTime>;
    email: string;
    id?: Nullable<number>;
    name: string;
    password: string;
}

export interface IMutation {
    _empty(): Nullable<string> | Promise<Nullable<string>>;
    createUser(createUserInput: CreateUserInput): User | Promise<User>;
    login(email: string, password: string): string | Promise<string>;
}

export interface IQuery {
    _empty(): Nullable<string> | Promise<Nullable<string>>;
    me(): User | Promise<User>;
    user(id: number): User | Promise<User>;
    users(): User[] | Promise<User[]>;
}

export interface User {
    createdAt: DateTime;
    email: string;
    id: number;
    name: string;
    role: string;
}

export type DateTime = any;
type Nullable<T> = T | null;
