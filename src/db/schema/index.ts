/**
 * Schéma Drizzle — point d'entrée unique de toutes les tables.
 *
 * Les tables sont ajoutées au fil des phases (cf. PROJET.md §5) :
 *  - Phase 1 : tables d'auth Better Auth (user, session, account, verification) + profile
 *  - Phase 2 : calendar_source, event
 *  - Phase 3 : weight_entry, water_entry
 *  - Phase 4 : food, recipe, recipe_ingredient, meal_plan, meal_plan_item
 *  - Phase 5 : shopping_list, shopping_item
 *
 * Règle commune : chaque table métier porte un `userId` (FK en cascade vers `user`)
 * et toutes les requêtes filtrent sur l'utilisateur de la session.
 */
export {};
