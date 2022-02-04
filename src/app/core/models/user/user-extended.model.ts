import { User } from "..";

export interface UserExtended extends User {
  emailNewAgain?: string;
  loginPasswordNew?: string;
  loginPasswordAgain?: string;
  languageTag?: string;
}
