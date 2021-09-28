# CTFB

A command-line tool to simplify combining and/or encoding audiobooks with
chapters.

CTFB will collect all files in the working directory that match given patterns,
create a metadata file treating the files as chapters, and encode them into a
single file with added chapter markers. If input files have chapter marks those
will be added to the chapters of the resulting file. In interactive mode, it
offers to manually edit the generated metadata file before creating the final
audio file in case the user wants to change, say, generated chapter markers.
Under the hood, it uses ffmpeg for encoding, hence, it supports a wide variety
of audio formats as input and output.

CTFB stands for whatever the user wants, for example, Commingle Thine Fabulous
Book.

## Installation

CTFB uses [ffmpeg](https://ffmpeg.org/), so make sure it's installed. Install
CTFB using NPM:

```bash
npm i ctfb -g
```

## Usage

By default, CTFB will combine all the opus files in the working directory into
an opus file named as the directory:

```bash
> ls
Chapter 1.opus
Chapter 2.opus
Chapter 3.opus
Chapter 4.opus
Chapter 5.opus

> ctfb
5 input files found.
Total duration: 00:19:05.234
Progress: 100.000%
Time Elapsed: 00:00:07.904
```

Each file will be treated as a chapter (or multiple chapters if they contain
chapter marks) and the resulting file will have chapter marks at the beginning
time of each original file named as the file sans the extension.

You can specify title, input patterns, output file name (with extension),
bitrate:

```bash
> ctfb -t "Fabulous Title" -p "*.wma" -p "*.mp3" -b 32k -o "fabulous.mp3"
```

This will combine all `.wma` and `.mp3` files into `fabulous.mp3` with a bitrate
of 32k.

If bitrate parameter is not supplied, CTFB will attempt to combine files without
re-encoding audio:

````bash
> ctfb -p "*.ogg" -o "out.ogg"
```

You can also use the interactive mode to enter the missing options manually 
and, more usefully, stop the processing before the final phase to manually edit the metadata file:
```bash
> ctfb -b 32k -i
Title: Fabulous Title
Input Pattern: *.mp3
Output File: abc.opus
5 input files found.
Total duration: 00:19:05.234
Press [m] to open the generated metadata file.
Press any other button to start creating the book.
````

### Adding chapters from Youtube timestamps

It might so happen that you want to turn a youtube video with timestamps into an
audiobook with chapters at the same timestamps. There is an excellent tool for
downloading the said videos:
[youtube-dl](https://github.com/ytdl-org/youtube-dl/). As of now, it doesn't
embed the timestamps into downloaded files, however, you can get the timestamps
written into a separate json file using `--write-info-json` parameter:

```bash
> youtube-dl -f 251 https://www.youtube.com/watch?v=krB0enBeSiE --write-info-json
[youtube] krB0enBeSiE: Downloading webpage
[info] Writing video description metadata as JSON to: Brendan Eich - JavaScript, Firefox, Mozilla, and Brave _ Lex Fridman Podcast #160-krB0enBeSiE.info.json
[download] Destination: Brendan Eich - JavaScript, Firefox, Mozilla, and Brave _ Lex Fridman Podcast #160-krB0enBeSiE.webm
...
```

Then you can re-encode and/or embed the chapters using CTFB and `-yt` parameter,
e.g.:

```bash
> ctfb -p "*.webm" -yt -b 32k -o 'podcast.opus'
```

In this case, CTFB will look for all webm files and their respective json files
with chapter info, combine them embedding the chapter info into a single opus
file with bitrate of 32k.

## Options

| Option | Default    | Description                                                   |
| ------ | ---------- | ------------------------------------------------------------- |
| -t     | (cwd)      | The title of the final file.                                  |
| -p     | *.mp3      | glob name patterns to look for as the input.                  |
| -o     | (cwd).opus | Output file name with extension.                              |
| -b     | 64k        | Bitrate of the final file.                                    |
| -i     | -          | Enables the interactive mode.                                 |
| -yt    | -          | Looks for chapters in .info.json files created by youtube-dl. |

## License

MIT @ Maga D. Zandaqo
