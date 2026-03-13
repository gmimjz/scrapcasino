"use client";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Section } from "../components/Section";
import { useRotateServerSeed } from "../mutations/useRotateServerSeed";
import {
  clientSeedSchema,
  useSetClientSeed,
} from "../mutations/useSetClientSeed";
import {
  createSteamTradeUrlSchema,
  useSetSteamTradeUrl,
} from "../mutations/useSetSteamTradeUrl";
import { useUser } from "../queries/useUser";
import { Color } from "../utils/enums";
import { generateRandomSeed } from "../utils/functions";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { FaRandom } from "react-icons/fa";
import { z } from "zod";

type SteamTradeUrlForm = { steamTradeUrl: string };
type ClientSeedForm = z.infer<typeof clientSeedSchema>;

export const Account = () => {
  const user = useUser();
  const { mutate: setSteamTradeUrl, isPending: isSettingSteamTradeUrl } =
    useSetSteamTradeUrl();
  const { mutate: rotateServerSeed, isPending: isRotatingServerSeed } =
    useRotateServerSeed();
  const { mutate: setClientSeed, isPending: isSettingClientSeed } =
    useSetClientSeed();

  const {
    control: steamControl,
    handleSubmit: handleSteamSubmit,
    formState: { errors: steamErrors },
  } = useForm<SteamTradeUrlForm>({
    resolver: zodResolver(createSteamTradeUrlSchema(user?.steamId ?? null)),
    defaultValues: { steamTradeUrl: user?.steamTradeUrl ?? "" },
  });

  const {
    control: seedControl,
    handleSubmit: handleSeedSubmit,
    setValue: setSeedValue,
    formState: { errors: seedErrors },
  } = useForm<ClientSeedForm>({
    resolver: zodResolver(clientSeedSchema),
    defaultValues: { clientSeed: generateRandomSeed() },
  });

  return (
    <>
      <Section title="STEAM TRADE URL">
        <p className="text-sm text-white/75">
          Your Steam Trade URL is required to deposit/withdraw. You can find it{" "}
          <Link
            className="font-semibold underline"
            target="_blank"
            href="https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url"
          >
            here.
          </Link>
        </p>
        <form
          className="flex flex-col gap-2"
          onSubmit={handleSteamSubmit(({ steamTradeUrl }) =>
            setSteamTradeUrl(steamTradeUrl),
          )}
        >
          <div className="flex gap-2">
            <Controller
              control={steamControl}
              name="steamTradeUrl"
              render={({ field }) => (
                <Input
                  value={field.value}
                  placeholder="Enter Steam Trade URL here..."
                  valid={!steamErrors.steamTradeUrl}
                  onChange={field.onChange}
                  ref={field.ref}
                  disabled={isSettingSteamTradeUrl}
                />
              )}
            />
            <Button
              color={Color.Green}
              type="submit"
              disabled={isSettingSteamTradeUrl}
            >
              SAVE
            </Button>
          </div>
          {steamErrors.steamTradeUrl && (
            <p className="text-red text-xs">
              {steamErrors.steamTradeUrl.message}
            </p>
          )}
        </form>
      </Section>
      <Section title="FAIRNESS">
        <p className="text-sm text-white/75">Hashed server seed:</p>
        <div className="flex gap-2">
          <Input value={user?.hashedServerSeed ?? ""} disabled={true} />
          <Button
            color={Color.Green}
            onClick={() => rotateServerSeed()}
            disabled={isRotatingServerSeed}
          >
            ROTATE
          </Button>
        </div>
        <p className="text-sm text-white/75">Client seed:</p>
        <Input value={user?.clientSeed ?? ""} disabled={true} />
        <form
          onSubmit={handleSeedSubmit(({ clientSeed }) =>
            setClientSeed(clientSeed),
          )}
        >
          <div className="flex flex-col gap-2 bg-white/10 p-2">
            <p className="text-sm text-white/75">New client seed:</p>
            <div className="flex gap-2">
              <Controller
                control={seedControl}
                name="clientSeed"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    placeholder="Enter random text..."
                    valid={!seedErrors.clientSeed}
                    onChange={field.onChange}
                    ref={field.ref}
                    disabled={isSettingClientSeed}
                  />
                )}
              />
              <Button
                color={Color.Blue}
                icon={<FaRandom size={16} />}
                onClick={() => setSeedValue("clientSeed", generateRandomSeed())}
                disabled={isSettingClientSeed}
              />
              <Button
                color={Color.Green}
                type="submit"
                disabled={isSettingClientSeed}
              >
                SAVE
              </Button>
            </div>
            {seedErrors.clientSeed && (
              <p className="text-red text-xs">
                {seedErrors.clientSeed.message}
              </p>
            )}
          </div>
        </form>
        <p className="text-sm text-white/75">Nonce:</p>
        <Input value={(user?.nonce ?? 0).toString()} disabled={true} />
      </Section>
    </>
  );
};
