/**
 * Schéma Drizzle — point d'entrée unique de toutes les tables.
 *
 * Tables ajoutées au fil des phases (cf. PROJET.md §5) :
 *  - Phase 1 : auth Better Auth (user, session, account, verification), profile, calendar_source,
 *              rate_limit (table technique anti brute-force)
 *  - Phase 2 : event
 *  - Phase 3 : weight_entry, water_entry
 *  - Phase 4 : food, recipe, recipe_ingredient, meal_plan, meal_plan_item
 *  - Phase 5 : shopping_list, shopping_item
 *
 * Règle commune : chaque table métier porte un `userId` (FK en cascade vers `user`,
 * donc supprimée avec le compte) et toutes les requêtes filtrent sur l'utilisateur
 * de la session.
 */
export * from "./auth";
export * from "./profile";
export * from "./planning";
export * from "./rate-limit";
