function encode(obj) {
  return btoa(JSON.stringify(obj));
}

function decode(str) {
  return JSON.parse(atob(str));
}

last = {}

function updateHeight(element) {
  if (last[element.id] == element.value) return;
  last[element.id] = element.value;
  element.style.height = "";
  element.style.height = element.scrollHeight + "px";
}

$(document).ready(e => {
  $(".wrap").on("keydown", e => e.ctrlKey && e.keyCode != 86 || e.metaKey || e.keyCode == 9 ? "" : e.preventDefault()).on("paste", e => e.preventDefault()).on("cut", e => e.preventDefault());
  const flag = document.getElementById("flag");
  const code = document.getElementById("code");
  const stdin = document.getElementById("stdin");
  const args = document.getElementById("args");
  const outlabel = document.getElementById("outlabel");
  const output = document.getElementById("output");
  const stderr = document.getElementById("stderr");
  const run = document.getElementById("run");
  const session = parseInt([...$("data-session")][0].innerHTML);
  const lang = [...$("data-lang")][0].innerHTML;
  const name = {
    "branch": "Branch",
    "yuno": "yuno",
    "flurry": "Flurry"
  };
  const gh = {
    "branch": "https://github.com/hyper-neutrino/branch-lang/",
    "yuno": "https://github.com/hyper-neutrino/yuno/",
    "flurry": "https://github.com/Reconcyl/flurry/"
  };
  
  function url() {
    var items = [code.value, stdin.value, args.value];
    if (flag) items.push(flag.value);
    return "https://interp.hyper-neutrino.xyz/" + lang + "/#" + encode(items);
  }
  
  function format() {
    var a = "";
    if (flag && flag.value) {
      a = " `" + flag.value + "`";
    }
    return "# [" + name[lang] + "](" + gh[lang] + ")" + a + ", " +
      code.value.length +
      " byte" + (code.value.length == 1 ? "" : "s") + "\n\n" +
      code.value.split("\n").map(a => "    " + a).join("\n") +
      "\n\nTry it on the [online " + name[lang] + " interpreter](" +
      url() +
      ")!";
  }
  
  function do_run() {
    if (run.innerHTML.trim() == "RUN") {
      run.innerHTML = "STOP";
      var form = {
        code: code.value,
        stdin: stdin.value,
        args: args.value,
        session: session
      };
      if (flag) form.flag = flag.value;
      $.post("execute", form, res => {
        outlabel.innerHTML = "STDOUT";
        output.value = res.stdout;
        stderr.value = res.stderr;
        run.innerHTML = "RUN";
      });
    } else {
      $.post("/kill", { session: session }, res => 0);
    }
  }
  
  if (document.location.hash) {
    var values = decode(document.location.hash.substring(1));
    code.value = values[0];
    stdin.value = values[1];
    args.value = values[2];
    if (flag) {
      flag.value = values[3];
    }
    output.value = format();
  }
  
  u = () => {
    updateHeight(code);
    updateHeight(stdin);
    updateHeight(args);
    if (flag) updateHeight(flag);
    updateHeight(output);
    updateHeight(stderr);
    requestAnimationFrame(u);
  };
  requestAnimationFrame(u);
  window.setTimeout(() => {
    last = {};
    u();
  }, 100);
  
  $("#run").on("click", e => {
    do_run();
  });
  
  $(document).on("keydown", e => {
    if (e.ctrlKey && e.keyCode == 13) {
      do_run();
    }
  })
  
  $("#stop").on("click", e => {
    console.log("(stop)");
  });
  
  $("#link").on("click", e => {
    document.location = url();
    outlabel.innerHTML = "Stack Exchange post format";
    output.value = format();
    updateHeight(output);
  });
  
  $("#inline").on("click", e => {
    document.location = url();
    outlabel.innerHTML = "Inline markdown format";
    output.value = "[Try it online!](" + document.location + ")";
  })
});