import type { components } from "../data/bkk-openapi";

type baseResponse = {
  code?: number;
  status?: components["schemas"]["Status"];
  text?: string;
  data?: object;
};

// TODO type parsing with zod
export async function fetchData<ResponseType extends baseResponse>(
  url: string,
  params: object
) {
  let loading = true;
  let error = "";
  let data = {};
  // FIXME this any type ain't kosher
  await fetch(url + new URLSearchParams(params as any))
    .then((response) => response.json())
    .then((d: ResponseType) => {
      if (d.code !== 200 || !d.data) {
        throw new Error(d.status);
      }
      data = d.data;
    })
    .catch((err) => {
      console.log(err);
      error = err;
    })
    .finally(() => (loading = false));
  return { loading, error, data };
}
