export function canAccess(user, permissions = []) {
    if (!user)
        return false;
    return permissions.every((p) => (user.permissions ?? []).includes(p));
}
