import { UserRoles } from "../../constants/UserRoles";

const users = [
  {
    name: "Admin",
    role: UserRoles.ADMIN,
    password: "$2a$12$YhqlFS1esTCMvzCjQclF8eoOhs1zTqS7Dj/No1KxuiN.rZtkHf9d6",
    avatar:
      "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress",
    isActivated: true,
    email: "admin@gmail.com",
  },

  {
    name: "Superadmin",
    role: UserRoles.SUPERADMIN,
    password: "$2a$12$YhqlFS1esTCMvzCjQclF8eoOhs1zTqS7Dj/No1KxuiN.rZtkHf9d6",
    avatar:
      "https://images.pexels.com/photos/2295744/pexels-photo-2295744.jpeg?auto=compress",
    isActivated: true,
    email: "superadmin@gmail.com",
  },

  {
    name: "User",
    role: UserRoles.USER,
    password: "$2a$12$YhqlFS1esTCMvzCjQclF8eoOhs1zTqS7Dj/No1KxuiN.rZtkHf9d6",
    avatar:
      "https://images.pexels.com/photos/1327405/pexels-photo-1327405.jpeg?auto=compress",
    isActivated: true,
    email: "user@gmail.com",
  },
];

export default users;
