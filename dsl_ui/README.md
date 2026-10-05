# DSL UI (DREAM)

Web UI of DREAM: write or upload a DSL program, run it and follow it live. The UI sends
the DSL to the DSL bridge (`ros_http_bridge2` in the `ros2_ws` workspace), which runs it
in the MuJoCo simulation or on the real cell.

How the whole system works, the DSL itself and all example programs: see the README of
the workspace, `~/Desktop/ros2_ws/README.md`.

## Run

```bash
npm install           # once
npm run dev           # http://localhost:3000
```

or, from the workspace: `~/Desktop/ros2_ws/run_ros_stack.bash ui`.

The bridge only accepts requests from `http://localhost:3000`, so keep that port.

Settings in `.env` (not in git):

| Variable | What |
|---|---|
| `DATABASE_URL` | PostgreSQL database where the projects are stored (Prisma, `prisma/schema.prisma`) |

## Use

1. **Projects** -> **New Project**: a name and the **API URL** of the bridge,
   `http://localhost:8000` (**Sim URL** is not used). **Add Project**, then **Open IDE**.
2. **Upload DSL** loads a `.dsl` file into the editor (examples:
   `~/Desktop/ros2_ws/src/ros_http_bridge2/examples/`), or type it in.
3. **Run** sends it to the bridge; the log on the right shows every step.
4. A yellow bar *Confirm action: ...* with **Yes** / **No** appears for steps that need a
   confirmation (`ToConfirm`, and every PLC block in real mode).
5. An `addTray` without a tray name opens a form that asks for the tray.
6. **Reset** stops the run before its next step.

The run ends with `WORKFLOW_DONE ...`, or `WORKFLOW_FAILED at step N/M ...` with the reason
on the line above.

## Bridge endpoints used

| Endpoint | When |
|---|---|
| `POST /run_workflow` `{dsl}` | **Run**; the answer is the live log (streamed text) |
| `POST /confirm_response` `{ok}` | **Yes** / **No** on a `NEED_CONFIRM` line |
| `POST /prompt_response` `{tray_name, object_name}` | the tray form on a `NEED_INPUT AddTray` line |
| `POST /reset` | **Reset** |
