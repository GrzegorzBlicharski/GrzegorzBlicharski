import { afterWrite } from "../persistence";

/** Server actions call revalidatePath after every write: persist the new events and re-render. */
export function revalidatePath(..._args: unknown[]): void {
  afterWrite();
}
