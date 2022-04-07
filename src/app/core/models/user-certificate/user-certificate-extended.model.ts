import { UserCertificate } from "./user-certificate.model";

export interface UserCertificateExtended extends UserCertificate {
    languageTag?: string;
}
