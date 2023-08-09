import { getOptions } from "@/options";
import { getRouter } from "@/router";
import { getPathWithBase, isBrowser } from "@/utils";
import event from "@/api/event";

export default (param) => {
  if (!isBrowser()) {
    return;
  }

  let template;

  if (typeof param === "string") {
    template = {
      page_path: param,
    };
  } else if (param.path || param.fullPath) {
    const {
      pageTrackerUseFullPath: useFullPath,
      pageTrackerPrependBase: useBase,
    } = getOptions();
    const router = getRouter();
    const base = router && router.options.base;
    const path = useFullPath ? param.fullPath : param.path;

    template = {
      ...(param.name ||
        (param.params && {
          page_title:
            Object.keys(param.params).length > 0
              ? param.params[Object.keys(param.params)[0]]
                  .slice(
                    0,
                    param.params[Object.keys(param.params)[0]].lastIndexOf(
                      "-"
                    ) > 0
                      ? param.params[Object.keys(param.params)[0]].lastIndexOf(
                          "-"
                        )
                      : param.params[Object.keys(param.params)[0]].length
                  )
                  .replaceAll("-", " ")
              : param.name,
        })),
      page_path: useBase
        ? getPathWithBase(path, base)
        : decodeURIComponent(path),
    };
  } else {
    template = param;
  }

  if (template.page_location == null) {
    template.page_location = decodeURIComponent(window.location.href);
  }

  if (template.send_page_view == null) {
    template.send_page_view = true;
  }

  template.page_referrer = decodeURIComponent(document.referrer);

  event("page_view", template);
};
