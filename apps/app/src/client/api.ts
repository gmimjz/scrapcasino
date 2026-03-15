/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum Role {
  Admin = "admin",
  Mod = "mod",
  User = "user",
}

export interface UserResponse {
  role: Role;
  id: string;
  steamId: string | null;
  username: string;
  avatarUrl: string | null;
  xp: number;
  balance: number;
  /** @format date-time */
  mutedUntil: string | null;
  steamTradeUrl: string | null;
  hashedServerSeed: string;
  clientSeed: string;
  nonce: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface UserWrappedResponse {
  user: UserResponse;
}

export interface PublicUserResponse {
  role: Role;
  id: string;
  steamId: string | null;
  username: string;
  avatarUrl: string | null;
  xp: number;
  balance: number;
  /** @format date-time */
  mutedUntil: string | null;
  steamTradeUrl: string | null;
  hashedServerSeed: string;
  clientSeed: string;
  nonce: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface PublicUserWrappedResponse {
  user: PublicUserResponse;
}

export interface SetSteamTradeUrlBody {
  /** @pattern /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)$/ */
  steamTradeUrl: string;
}

export interface SetClientSeedBody {
  /**
   * @minLength 1
   * @maxLength 32
   */
  clientSeed: string;
}

export interface ChatMessageResponse {
  id: string;
  userId: string;
  message: string;
  isRemoved: boolean;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface PartialUserResponse {
  role: Role;
  id: string;
  steamId: string | null;
  username: string;
  avatarUrl: string | null;
  xp: number;
  balance?: number;
  /** @format date-time */
  mutedUntil?: string | null;
  steamTradeUrl?: string | null;
  hashedServerSeed?: string;
  clientSeed?: string;
  nonce?: number;
}

export interface GetMessagesResponse {
  chatMessages: ChatMessageResponse[];
  users: PartialUserResponse[];
}

export interface SendMessageBody {
  /**
   * @minLength 1
   * @maxLength 200
   */
  message: string;
}

export interface ChatMessageWrappedResponse {
  chatMessage: ChatMessageResponse;
}

export interface MuteUserBody {
  /** @min 1 */
  duration: number;
}

export interface CrateResponse {
  id: string;
  name: string;
  imageUrl: string;
  cost: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface GetCratesResponse {
  crates: CrateResponse[];
}

export interface CrateItemResponse {
  id: string;
  crateId: string;
  itemId: string;
  value: number;
  chance: number;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ItemResponse {
  id: string;
  name: string;
  imageUrl: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface GetCrateResponse {
  crate: CrateResponse;
  crateItems: CrateItemResponse[];
  items: ItemResponse[];
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Scrap Casino API
 * @version 1.0
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerLogin
     * @request GET:/auth/login
     */
    authControllerLogin: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/login`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerReturn
     * @request GET:/auth/return
     */
    authControllerReturn: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/return`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerLogout
     * @request GET:/auth/logout
     */
    authControllerLogout: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/logout`,
        method: "GET",
        ...params,
      }),
  };
  user = {
    /**
     * No description
     *
     * @tags User
     * @name UserControllerGetUser
     * @request GET:/user
     */
    userControllerGetUser: (params: RequestParams = {}) =>
      this.request<UserWrappedResponse, any>({
        path: `/user`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerGetUserById
     * @request GET:/user/{userId}
     */
    userControllerGetUserById: (userId: string, params: RequestParams = {}) =>
      this.request<PublicUserWrappedResponse, any>({
        path: `/user/${userId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerSetSteamTradeUrl
     * @request POST:/user/steam-trade-url
     */
    userControllerSetSteamTradeUrl: (
      data: SetSteamTradeUrlBody,
      params: RequestParams = {},
    ) =>
      this.request<UserWrappedResponse, any>({
        path: `/user/steam-trade-url`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerRotateServerSeed
     * @request POST:/user/server-seed/rotate
     */
    userControllerRotateServerSeed: (params: RequestParams = {}) =>
      this.request<UserWrappedResponse, any>({
        path: `/user/server-seed/rotate`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerSetClientSeed
     * @request PUT:/user/client-seed
     */
    userControllerSetClientSeed: (
      data: SetClientSeedBody,
      params: RequestParams = {},
    ) =>
      this.request<UserWrappedResponse, any>({
        path: `/user/client-seed`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  chat = {
    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerGetMessages
     * @request GET:/chat/messages
     */
    chatControllerGetMessages: (params: RequestParams = {}) =>
      this.request<GetMessagesResponse, any>({
        path: `/chat/messages`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerSendMessage
     * @request POST:/chat/message
     */
    chatControllerSendMessage: (
      data: SendMessageBody,
      params: RequestParams = {},
    ) =>
      this.request<ChatMessageWrappedResponse, any>({
        path: `/chat/message`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerDeleteMessage
     * @request DELETE:/chat/message/{id}
     */
    chatControllerDeleteMessage: (id: string, params: RequestParams = {}) =>
      this.request<ChatMessageWrappedResponse, any>({
        path: `/chat/message/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerMuteUser
     * @request POST:/chat/mute/{userId}
     */
    chatControllerMuteUser: (
      userId: string,
      data: MuteUserBody,
      params: RequestParams = {},
    ) =>
      this.request<UserWrappedResponse, any>({
        path: `/chat/mute/${userId}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerUnmuteUser
     * @request POST:/chat/unmute/{userId}
     */
    chatControllerUnmuteUser: (userId: string, params: RequestParams = {}) =>
      this.request<UserWrappedResponse, any>({
        path: `/chat/unmute/${userId}`,
        method: "POST",
        format: "json",
        ...params,
      }),
  };
  crates = {
    /**
     * No description
     *
     * @tags Crate
     * @name CrateControllerGetCrates
     * @request GET:/crates
     */
    crateControllerGetCrates: (params: RequestParams = {}) =>
      this.request<GetCratesResponse, any>({
        path: `/crates`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Crate
     * @name CrateControllerGetCrate
     * @request GET:/crates/{id}
     */
    crateControllerGetCrate: (id: string, params: RequestParams = {}) =>
      this.request<GetCrateResponse, any>({
        path: `/crates/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Crate
     * @name CrateControllerOpenCrate
     * @request POST:/crates/{id}/open
     */
    crateControllerOpenCrate: (id: string, params: RequestParams = {}) =>
      this.request<CrateItemResponse, any>({
        path: `/crates/${id}/open`,
        method: "POST",
        format: "json",
        ...params,
      }),
  };
}
