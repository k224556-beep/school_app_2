import { Role } from "./models";

export function routeForRole(role: Role) {
  switch (role) {
    case "Admin":
      return "/";
    case "Teacher":
      return "/(teacher-tabs)";
    case "Parent":
      return "/(parent-tabs)";
    default:
      return "/auth/login";
  }
}

export default routeForRole;
