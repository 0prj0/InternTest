import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db,Schema } from "../../../packages/db/index"; // your drizzle instance
import { config } from "../../../packages/infra";

export const auth = betterAuth({
	plugins: [admin()],
    baseURL: config.API_BASE_URL,
    secret: config.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: Schema,
        usePlural: true,
    }),
	user: {
		additionalFields: {
			firstName: {
				type: "string",
				required: false,
				input: true,
			},
			lastName: {
				type: "string",
				required: false,
				input: true,
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					const firstName =
						typeof user.firstName === "string" ? user.firstName.trim() : "";
					const lastName =
						typeof user.lastName === "string" ? user.lastName.trim() : "";

					if (firstName || lastName) {
						return { data: { ...user, firstName, lastName } };
					}

					const nameParts = user.name.trim().split(/\s+/);
					const derivedLastName = nameParts.length > 1 ? nameParts.pop()! : "";

					return {
						data: {
							...user,
							firstName: nameParts.join(" "),
							lastName: derivedLastName,
						},
					};
				},
			},
		},
	},
    emailAndPassword: { 
        enabled: true, 
        //autoSignIn: false
        autoSignInAfterVerification: true,
    }, 
});
