export function setCookie(name: string, value: string, days?: number) {
    const DEFAULT_DAYS = 365;
    const date = new Date();
    date.setTime(date.getTime() + (days ?? DEFAULT_DAYS * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;Secure;SameSite=Lax`;
}

export function getCookie(name: string): string | undefined {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        const c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return undefined;
}

export function deleteCookie(name: string) {
    document.cookie = `${name}=; Max-Age=-99999999; path=/;Secure;SameSite=Lax`;
}
