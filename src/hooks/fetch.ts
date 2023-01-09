import type { components } from "../data/bkk-openapi";

type baseResponse = {
  code?: number;
  status?: components["schemas"]["Status"];
  text?: string;
  data?: any;
};

export async function fetchData<ResponseType extends baseResponse>(
  url: string,
  params: Object
) {
  let loading = true;
  let error = "";
  let data = {};
  // FIXME this any type ain't kosher
  await fetch(url + new URLSearchParams(params as any))
    .then((response) => response.json())
    .then((d: ResponseType) => {
      console.log(d);
      if (d.code !== 200) {
        throw new Error(d.status);
      }
      data = d.data;
    })
    .catch((err) => {
      error = err;
    })
    .finally(() => (loading = false));
  return { loading, error, data };
}
