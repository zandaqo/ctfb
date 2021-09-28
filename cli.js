#!/usr/bin/env node
const path = require("path");
const readline = require("readline");
const CTFB = require("./index");

const options = {
  "title": { question: "Title: ", answer: path.basename(process.cwd()) },
  "pattern": { question: "Input Pattern: ", answer: "*.opus" },
  "output": {
    question: "Output File: ",
    answer: path.basename(process.cwd()) + ".opus",
  },
  "bitrate": { question: "Bitrate: ", answer: "" },
};

const help = `
Version: 1.2
Usage: ctfb [options]

Options:
    -t   The title of the final file
    -p   glob name patterns to look for as the input
    -o   Output file name with extension
    -b   Bitrate of the final file
    -i   Enables the interactive mode
    -yt  Looks for chapters in .info.json files created by youtube-dl.

Examples:
    # By default, combines all *.opus files in the directory into %directory-name%.opus file
    ctfb
    
    # Combine all *.wma and *.mp3 files into fabulous.mp3 with title Fabulous Book and bitrate 32k
    ctfb -t "Fabulous Title" -p "*.wma" -p "*.mp3" -b 32k -o "fabulous.mp3"
    
    # Set bitrate and open cftb in the interactive mode to fill in the rest of paramters and optionally edit metadata file 
    ctfb -b 32k -i

    # Combines files without re-encoding audio if bitrate is not set
    ctfb -p "*.ogg" -o "out.ogg"
`;

async function main(bookPath, args) {
  const questions = [];
  const answers = {};
  let isInteractive = false;
  let isYoutube = false;

  /* Parse command line options. */
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    switch (arg) {
      case "-i":
        isInteractive = true;
        break;
      case "-yt":
        isYoutube = true;
        break;
      case "-t":
        answers.title = args[++i];
        break;
      case "-p":
        answers.pattern = answers.pattern
          ? [...answers.pattern, args[++i]]
          : [args[++i]];
        break;
      case "-o":
        answers.output = args[++i];
        break;
      case "-b":
        answers.bitrate = args[++i];
        break;
      case "-h":
        console.log(help);
        process.exit(0);
        break;
      default:
        break;
    }
    i++;
  }

  /* Collect missing options and use default values if in non-interactive mode. */
  for (const option of Object.keys(options)) {
    if (!Reflect.has(answers, option)) {
      if (isInteractive) {
        questions.push(option);
      } else {
        answers[option] = option === "pattern"
          ? [options.pattern.answer]
          : options[option].answer;
      }
    }
  }

  /* Ask remaining questions if in interactive mode. */
  if (questions.length) {
    let questionCounter = 0;
    let question = questions[0];
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt(options[question].question);
    rl.prompt();
    rl.write(options[question].answer);
    rl.on("line", async (answer) => {
      answers[question] = question === "pattern" ? [answer] : answer;
      questionCounter++;
      if (questionCounter < questions.length) {
        question = questions[questionCounter];
        rl.setPrompt(options[question].question);
        rl.prompt();
        rl.write(options[question].answer);
      } else {
        rl.close();
        await new CTFB(bookPath, answers).process(isInteractive, isYoutube);
      }
    });
  } else {
    await new CTFB(bookPath, answers).process(isInteractive, isYoutube);
  }
}

if (require.main === module) {
  const [, , ...args] = process.argv;
  main(process.cwd(), args);
}

module.exports = main;
