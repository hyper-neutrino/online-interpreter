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
  const code = document.getElementById("code");
  const stdin = document.getElementById("stdin");
  const args = document.getElementById("args");
  const stdout = document.getElementById("stdout");
  const stderr = document.getElementById("stderr");
  const cgcc = document.getElementById("cgcc");
  const run = document.getElementById("run");
  const session = parseInt([...$("data-session")][0].innerHTML);
  
  function url() {
    return "https://branch.hyper-neutrino.xyz/#" + encode([code.value, stdin.value, args.value]);
  }
  
  function format() {
    return "# [Branch](https://github.com/hyper-neutrino/branch-lang/), " +
      code.value.length +
      " bytes\n\n" +
      code.value.split("\n").map(a => "    " + a).join("\n") +
      "\n\nTry it on the [online Branch interpreter](" +
      url() +
      ")!";
  }
  
  function do_run() {
    if (run.innerHTML.trim() == "RUN") {
      run.innerHTML = "STOP";
      $.post("/execute", {
        code: code.value,
        stdin: stdin.value,
        args: args.value,
        session: session
      }, res => {
        stdout.value = res.stdout;
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
    cgcc.value = format();
  }
  
  u = () => {
    updateHeight(code);
    updateHeight(stdin);
    updateHeight(args);
    updateHeight(cgcc);
    updateHeight(stdout);
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
    cgcc.value = format();
    updateHeight(cgcc);
  });
});