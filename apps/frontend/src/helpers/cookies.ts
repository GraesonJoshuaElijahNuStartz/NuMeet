'use server';
import { cookies } from 'next/headers';
import { User } from '../types/User.type';

export const setUser = (user?: User) => {
  return new Promise((resolve) => {
    const cookiesRes = cookies().set('user', JSON.stringify(user));
    if (!!cookiesRes) resolve(true);
  });
};

export const removeUser = () => {
  cookies().delete('user');
};

export const getUser = () => {
  try {
    const user = cookies().get('user')?.value;
    return (user && JSON.parse(user)) || null;
  } catch (error) {
    return null;
  }
};
