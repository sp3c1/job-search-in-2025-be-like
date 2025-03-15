## Notes

After 20 minutes of talking about previous code, interviewer said please write tetris, collision detection stuff like that.

TBH in 20 minutes I could not even decide really on what data structures I want, what is object what is function.

Though it took me about 1,5 -2 h to think of it and decide how to resolve all the issues I thought off:

- like bounding box of shape indexed from top, while having more then 1 line
- how to represent the shapes as such in a bounding box, so it make sense to compare to lines
- how check only relevant lines for collissions and do it uniformly
- how to change the shape into the line struct - where the shape does not matter and what changes now is line

Then it took me about 1,5 hours to flash it out in a code, where I realised I still thought wrong about some concepts.
I think this is ok approach if you do not track the color of elements in line, would need to be adjusted to store this
information in board lines (at the moment it is [0,0,0,0,0,1] array per row).

This is still a very loose outline. But I would judge it as a valid first draft.
