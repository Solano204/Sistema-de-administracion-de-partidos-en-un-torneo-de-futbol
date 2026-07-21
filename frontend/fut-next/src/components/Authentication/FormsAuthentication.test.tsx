import { describe, it, expect, vi } from "vitest";
import type { ReactElement, ReactNode } from "react";
import { FormType } from "@/app/utils/Domain/AuthenticationActions/TypesAuth";

// LoginSignupForm is an async Server Component that internally renders
// FormContainer (a "use client" component using useActionState/useRouter)
// and reads cookies() directly - actually DOM-rendering it through RTL
// would require mocking next/navigation's router, the sonner toast library,
// AND next/headers, fighting infrastructure unrelated to the bug this test
// exists to prove. Instead: call the async component function directly to
// get its already-resolved React element tree (a plain object graph before
// any DOM rendering happens), then walk that tree structurally. This is
// the right tool for testing a Server Component's conditional-rendering
// LOGIC in isolation from the client-side machinery it's composed with.
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));
vi.mock("@/app/utils/Domain/AuthenticationActions/AuthImpSpring", () => ({
  logIn: vi.fn(),
  signUp: vi.fn(),
  changePassword: vi.fn(),
  changeUsername: vi.fn(),
  updateUserDetails: vi.fn(),
}));

import LoginSignupForm from "./FormsAuthentication";
import { Input } from "../ui/input";

// type may be a DOM tag string ("select") or a component reference (Input) -
// matched by strict equality either way.
function findAllByType(node: ReactNode, type: string | Function): ReactElement[] {
  const results: ReactElement[] = [];
  const visit = (n: ReactNode) => {
    if (n === null || n === undefined || typeof n === "boolean") return;
    if (Array.isArray(n)) {
      n.forEach(visit);
      return;
    }
    const el = n as ReactElement;
    if (el && typeof el === "object" && "type" in el) {
      if (el.type === type) results.push(el);
      const children = (el.props as any)?.children;
      if (children !== undefined) visit(children);
    }
  };
  visit(node);
  return results;
}

// CRITICAL, found here, not fixed: the signup form's role <select> has
// `hidden={!existAD}` on the select ITSELF, while the "Administrator"
// <option> inside it is only added when `{!existAD && (...)}`. These two
// conditions are on the SAME boolean, so the Administrator option is only
// ever inserted into the DOM at exactly the moment the entire select is
// hidden - it can never actually be seen or selected through this UI,
// under either value of existAD:
//   - existAD=true (an admin already exists): select IS visible, but the
//     Administrator option is NOT rendered - correct/intended behavior.
//   - existAD=false (bootstrap - no admin exists yet): the Administrator
//     option WOULD be rendered, but the entire select is hidden, silently
//     forcing every signup during the bootstrap window to role="USER"
//     (the select's defaultValue) with NO way to self-register as the
//     first admin through this form - even though the backend explicitly
//     supports exactly that one-time bootstrap flow (see this session's
//     backend work: CommandHelperUserTest's insertUser_noAdminExistsYet_...
//     test and the critical bootstrap-guard bug fixed in REVIEW_NOTES.md).
//     This looks like an inverted `hidden={!existAD}` that should almost
//     certainly read `hidden={existAD}` instead - flagged, not changed,
//     since fixing UI logic isn't a test-writing decision.
describe("LoginSignupForm (SIGNUP) - role selector hidden/existAD logic", () => {
  it("existAD=false (bootstrap, no admin exists yet): the ENTIRE role select is hidden, so the Administrator option that WOULD exist is unreachable", async () => {
    const element = await LoginSignupForm({ type: FormType.SIGNUP, existAD: false });
    const selects = findAllByType(element, "select");

    expect(selects).toHaveLength(1);
    expect(selects[0].props.hidden).toBe(true); // the whole selector is hidden here

    const adminOptions = findAllByType(selects[0].props.children, "option").filter(
      (o) => o.props.value === "ADMINISTRADOR"
    );
    expect(adminOptions).toHaveLength(1); // it WAS added to the tree...
    // ...but since the parent <select> is hidden, it's unreachable through the UI.
  });

  it("existAD=true (an admin already exists): select is visible, and the Administrator option is correctly absent", async () => {
    const element = await LoginSignupForm({ type: FormType.SIGNUP, existAD: true });
    const selects = findAllByType(element, "select");

    expect(selects[0].props.hidden).toBe(false);

    const adminOptions = findAllByType(selects[0].props.children, "option").filter(
      (o) => o.props.value === "ADMINISTRADOR"
    );
    expect(adminOptions).toHaveLength(0);
  });

  it("net effect across BOTH states: the Administrator option is never simultaneously present AND visible", async () => {
    for (const existAD of [true, false]) {
      const element = await LoginSignupForm({ type: FormType.SIGNUP, existAD });
      const select = findAllByType(element, "select")[0];
      const hasAdminOption = findAllByType(select.props.children, "option").some(
        (o) => o.props.value === "ADMINISTRADOR"
      );

      // The bug, stated as a single invariant: it is never true that the
      // select is visible AND the admin option is present.
      expect(select.props.hidden === true || hasAdminOption === false).toBe(true);
    }
  });
});

describe("LoginSignupForm (LOGIN)", () => {
  it("renders exactly two Input fields (user, password) and no role select", async () => {
    const element = await LoginSignupForm({ type: FormType.LOGIN, existAD: true });

    const inputs = findAllByType(element, Input);
    const selects = findAllByType(element, "select");

    expect(inputs).toHaveLength(2);
    expect(inputs.map((i) => i.props.name)).toEqual(["user", "password"]);
    expect(selects).toHaveLength(0);
  });
});
