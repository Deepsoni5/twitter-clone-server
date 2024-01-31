import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";

interface GoogleTokenResult {
  iss?: string;
  nbf?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
  azp?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOauthURL.searchParams.set("id_token", googleToken);

    //get the data of the user
    const { data } = await axios.get<GoogleTokenResult>(
      googleOauthURL.toString(),
      {
        responseType: "json",
      }
    );

    // check user is exists

    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email as string,
          firstName: data.given_name as string,
          lastName: data.family_name,
          profileImageURL: data.picture,
        },
      });
    }
    const userInDB = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!userInDB) {
      throw new Error("User With that email not found!!");
    }
    const userToken = JWTService.generateTokenForUser(userInDB);
    return userToken;
  },
};

export const resolvers = { queries };
