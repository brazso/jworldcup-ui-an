import { EredmenyEnum } from './enums';

export interface CommonResponse {
    successful: boolean;
    error: string;

    /**
     * true akkor a művelet, amely előállította a választ, módosítást okozott. egyénként false.
     */
    modified?: boolean;

    /**
     *  true akkor megerősítő kérdésre kell választ adni, az eredmeny mező SIKERES, a kérdés maga a hiba mezőben található
     */
    confirmed?: boolean;
}
