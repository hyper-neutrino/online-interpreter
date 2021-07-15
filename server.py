import html, random, subprocess, traceback

from flask import Flask, render_template, request, send_file
from flask_cors import CORS

from urllib.parse import unquote

app = Flask("__tio__")
CORS(app)

import os
os.system("rm -rf sessions")
os.system("mkdir sessions")

sessions = {}
term = set()

@app.route("/")
def serve_root():
  return render_template("launch.html")

@app.route("/<lang>/")
def serve_lang(lang):
  session = random.randint(1, 2 ** 30)
  sessions[session] = None
  return render_template("index.html", session = session, lang = lang, name = {"branch": "Branch", "yuno": "yuno", "flurry": "Flurry"}[lang], title = {"branch": "Esoteric Programming Language", "yuno": "golfing language", "flurry": "Esoteric Programming Language"}[lang])

@app.route("/kill", methods = ["POST"])
def kill():
  session = int(request.form["session"])
  if sessions.get(session) is None: return ""
  sessions[session].kill()
  term.add(session)
  return ""

@app.route("/<lang>/execute", methods = ["POST"])
def execute(lang):
  try:
    code, stdin, args, session = [html.unescape(request.form[x]) for x in ["code", "stdin", "args", "session"]]
    flag = [request.form["flag"]] if "flag" in request.form else []
    session = int(session)
    if session not in sessions:
      return {"stdout": "", "stderr": "The session was invalid! You may need to reload your tab."}
    os.system(f"rm -rf sessions/{session}")
    os.mkdir(f"sessions/{session}")
    with open(f"sessions/{session}/.stdin", "w") as f:
      f.write(stdin)
    with open(f"sessions/{session}/.stdin", "r") as x:
      with open(f"sessions/{session}/.stdout", "w") as y:
        with open(f"sessions/{session}/.stderr", "w") as z:
          try:
            cmd = {"branch": (["../branch-lang/branch", "-m", "131072", "131072"], []), "yuno": (["../yuno/yuno"], []), "flurry": (["../flurry/Flurry"], ["-c"])}
            args = args.split("\n") if args else []
            sessions[session] = subprocess.Popen(["time", "-f", "Total time    %E\nUser Mode     %U\nKernel Mode   %S\nCPU           %P", *cmd[lang][0], *flag, *cmd[lang][1], code, *args], stdin = x, stdout = y, stderr = z)
            sessions[session].wait(timeout = 60)
            pf = ""
          except subprocess.TimeoutExpired:
            sessions[session].kill()
            pf = "Your program exceeded the 60 second time limit and was terminated!\n\n"
          if session in term:
            term.remove(session)
            pf = "Your program was killed by request!\n\n"
    with open(f"sessions/{session}/.stdout", "r") as x:
      with open(f"sessions/{session}/.stderr", "r") as y:
        val = {"stdout": x.read()[:131072], "stderr": pf + y.read()}
    os.system(f"rm -rf sessions/{session}")
    return val
  except:
    traceback.print_exc()
    return {"stdout": "", "stderr": "An unexpected error occurred on the server side."}

if __name__ == "__main__":
  app.run(host = "0.0.0.0", port = 5808, debug = True)