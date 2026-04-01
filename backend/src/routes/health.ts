type RouteRequest = {
  method?: string;
};

type RouteResponse = {
  setHeader?: (name: string, value: string | string[]) => void;
  status: (statusCode: number) => RouteResponse;
  json: (body: { ok: true; service: string; timestamp: string } | { ok: false; error: string }) => void;
};

export async function healthRoute(req: RouteRequest, res: RouteResponse) {
  res.setHeader?.("Allow", "GET");

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "method_not_allowed",
    });
  }

  return res.status(200).json({
    ok: true,
    service: "daytri_backend",
    timestamp: new Date().toISOString(),
  });
}

export default healthRoute;
