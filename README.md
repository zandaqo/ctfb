# CTFB
A command-line tool to simplify combining and/or encoding audiobooks with chapters.

CTFB will collect all files in the working directory that match given patterns, 
create a metadata file treating the files as chapters, and encode them into a single file
with added chapter markers. In interactive mode, it offers to manually edit the generated metadata file
before creating the final audio file in case the user wants to change, say, generated chapter markers.
Under the hood, it uses ffmpeg for encoding, hence, it supports a wide variety of audio formats as input and output.

CTFB stands for whatever the user wants, for example, Commingle Thine Fabulous Book.

## Installation
CTFB uses [ffmpeg](https://ffmpeg.org/), so make sure it's installed.
Install CTFB using NPM:

```bash
npm i ctfb -g
```

## Usage
By default, CTFB will combine all the mp3 files in the working directory into an opus file named as the directory:
```bash
> ls
Chapter 1.mp3
Chapter 2.mp3
Chapter 3.mp3
Chapter 4.mp3
Chapter 5.mp3

> ctfb
5 input files found.
Total duration: 00:19:05.234
Progress: 100.000%
Time Elapsed: 00:00:07.904
```
Each file will be treated as a chapter, and the resulting file
 will have chapter marks at the beginning time of each original file 
 named as the file sans the extension.

You can specify title, input patterns, output file name (with extension), bitrate:
```bash
> ctfb -t "Fabulous Title" -p "*.wma" -p "*.mp3" -b 32k -o "fabulous.mp3"
```
This will combine all `.wma` and `.mp3` files into `fabulous.mp3` with a bitrate of 32k.

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
```
## Options
| Option | Default | Description |
|---|---|---|
| -t  | (cwd)  | The title of the final file.  |
| -p  | *.mp3  | glob name patterns to look for as the input. |
| -o  | (cwd).opus  | Output file name with extension.  |
| -b  | 64k  | Bitrate of the final file.  |
| -i  | -  | Enables the interactive mode.  |

## License
MIT @ Maga D. Zandaqo
