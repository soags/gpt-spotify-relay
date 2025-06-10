import { http } from "@google-cloud/functions-framework";
import { notionRelay } from "./notion";
import { spotifyRelay } from "./spotify";

http("notionRelay", notionRelay);
http("spotifyRelay", spotifyRelay);
