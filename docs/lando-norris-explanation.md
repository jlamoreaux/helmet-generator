0:00
A couple days ago, this Lando Norris
0:02
website dropped and everybody is
0:04
freaking out about it. It's just got
0:06
this really cool 3D animation which is
0:08
like eight layers deep, some really cool
0:10
scroll effects on it. Uh when you hover
0:12
over everything, the divs are
0:14
non-standard shapes. The more time you
0:17
spend on this website, the more you
0:18
realize there's just so many nifty
0:21
little parts. So, of course, I
0:23
downloaded all 75,000 lines of code and
0:27
dug through it, and I found so many neat
0:30
approaches. So, I'm going to break down
0:32
how they did it, what technology they
0:34
used, and and ideally how you can build
0:36
something like this yourself. All right,
3D Helmet Effect
0:38
let's start with this like scene right
0:40
here. So, this is 3JS 3D canvas. And the
0:43
more I looked into the code, the more I
0:44
realized like there's seven or eight
0:46
different layers here at play. So, let's
0:49
break it down. So, at the very basic,
0:51
there is just an image of Lando, right?
0:54
And as you move your cursor around,
0:56
you'll see he's kind of moving around
0:58
just a little bit. Um, and it gives a
1:00
subtle 3D effect, and that's using
1:02
something called depth maps. Um, so
1:04
depth maps are pretty cool. You can
1:06
generate them with like a special
1:07
camera, but AI is also really good at
1:09
it. So, here I I built a little demo,
1:12
and it will take this image and try to
1:15
estimate what is of depth. So here here
1:18
look at this thing. The white stuff is
1:20
closer whereas the darker stuff is
1:23
further away. And then you can throw
1:25
that into a 3D canvas and like you can
1:27
really exaggerate it. Like it can it can
1:29
be pretty crazy here, right? Um but
1:33
normally what you do, and this is what
1:34
they're doing at Lando, is you just give
1:36
it a little bit of a subtle thing to it
1:40
and then you move it around like that.
1:42
And that's a really cool um effect. And
1:45
it actually works like pretty well. like
1:47
even if you go to the things in the
1:49
background, um it can find like the
1:51
leaves on the tree.
1:54
So that's a depth map that they have
1:56
over top of him. Um but there's also an
1:59
alpha map which is just for punching out
2:01
the photo of him. And then there is a
2:03
roughness map. And a roughness map is
2:06
when light hits it, uh how does it
2:09
reflect, you know? So, the white is
2:11
going to be uh absorb the colors really
2:13
well and then the darker colors are
2:15
going to reflect the light a little
2:17
well. And you can hardly see it as you
2:19
move around, but it's just very subtle.
2:22
And of course, on top of that, they are
2:24
rendering out the helmet. They're
2:26
rendering out the 3D view of this
2:28
helmet. And they actually have a second
2:30
image of him with a slightly darker um
2:34
let me show you. I think it's called
2:36
like shadow.
2:38
There we go. There's a slightly darker
2:40
shadow underneath here to make it look
2:42
like when he has the the helmet on. On
Blob Masking
2:45
top of that, they are rendering out the
2:47
helmet and then deciding what they show.
2:49
It's just being masked on and off via
2:52
custom shaders. And it's using some sort
2:55
of custom shader that makes these blobs.
2:58
Um not explicitly sure if it's this one
3:00
or not, but this is kind of the idea. Um
3:02
where it's like a fluid cursor. as you
3:04
move it, depending on how fast you move
3:06
it and and what angle you move it, it
3:08
will generate these blobs. Um, and then
3:10
you can mask out the different parts
3:12
while showing it. So, pretty nifty thing
3:14
on the 3D. But let's go a little bit
3:17
further and look on the on track page
3:19
here. Um, and they have this custom
3:21
rendering of this helmet. This is really
3:23
cool. So, the helmet is also done in
3:26
3JS, which is rendered out in 3D. Um,
3:29
and this is this is what the helmet is.
3:31
I downloaded it. It's a what a glTF
3:35
file. Um, and it's just this just a
3:37
blank model that you have here. And you
3:39
can kind of spin it around. Then each of
3D Helmet Rendering
3:41
the helmets that he has, cuz there's
3:43
several different helmets, all have
3:45
their designs um up as a map. So you see
3:48
here's like one of the ones with the
3:50
monster energy design on top of it. Uh
3:53
here's another one. It's actually kind
3:55
of cool to to see this. So it's all
3:57
designed in flat. Um, and then 3JS will
4:00
apply that to the model. But that's not
4:04
it. That's just that's just one part of
4:06
it, right? There's also this base color
4:08
on here. So, all of them have this
4:10
little McLaren um and Android on the
4:13
visor. There also is maps for which
4:17
parts of the helmet are metallic. Um,
4:20
there's a normal map. And this one is
4:21
really cool. So, as you scroll, you're
4:24
going to see how the light hits this
4:26
black part of the visor right here. And
4:28
it obviously the buttons don't the
4:31
buttons reflect differently than the
4:32
actual visor. And that's because of this
4:34
map right here, the roughness map. So
4:37
something that is black in the roughness
4:39
map, this is the visor, is going to
4:42
reflect light quite a bit. And things
4:44
that are gray and and and more towards
4:47
the white side are not going to reflect
4:49
light very much. So you can see that
4:51
they're reflecting light a little
4:53
different. There's then the buttons are
4:56
you're saying which parts are metallic
4:58
and how they reflect light. There's just
5:01
so much to it and then as you scroll the
5:04
whole thing kind of spins around. I
5:06
thought this was really cool cuz like
5:08
the Apple website does a lot of stuff
5:10
like this but often Apple will just
5:12
render out a video and and they'll just
5:15
scrub that video back and forth as
5:17
you're scrolling. No, no. This is this
5:19
is an actually like a 3D model that is
5:21
spinning around and having seven or
5:24
eight different maps and mats applied to
5:25
it. Scrolling on this website is
Scrolling
5:28
entirely implemented in JavaScript. So,
5:30
normally I'm a scrolljacking hater
5:32
because it's so frustrating to visit a
5:34
website that takes over your scroll. But
5:36
this one's using a library called
5:38
leanest which does a pretty good job at
5:41
it and it feels fairly natural. and
5:44
allows you to do things like like go
5:46
sideways or position sticky things when
5:49
they come in. There are browser APIs of
5:51
scroll driven animations along with
5:53
things like position sticky to allow you
5:55
to do this. However, they're not it's
5:57
not in Firefox yet. And I'm assuming
5:59
that's why they didn't use this. So,
6:03
that still works. You can still press
6:04
spacebar. You can still search for words
6:07
on here and it will jump to where they
6:09
are on the page. So, it actually feels
6:11
pretty good. It uses a library called
Animations
6:13
Lenus which are simply just updating
6:15
inline style values. So it's not using
6:17
web animations API or anything like
6:19
that. And surprisingly it's actually
6:22
using jQuery and a library called tram
6:26
which was last updated 9 years ago. And
6:29
I don't know what the reason for that
6:31
is. I'm assuming they've used it for
6:33
probably many websites and they have a
6:35
whole bunch of code that's written in
6:37
it. that is simply just updating inline
6:40
style values and it actually works
6:42
pretty well and is pretty butter smooth.
6:44
I'll talk about performance in just a
Non-standard Div Shapes
6:46
sec. Now, as you scroll down to the
6:47
helmet section, they got these really
6:49
interesting shapes and then as you hover
6:51
over each of the helmets, you see an
6:53
actual photo of them wearing it. And if
6:55
you scroll all the way to the bottom,
6:57
you see this really cool shape. So,
6:59
these are doing these are being done
7:02
with CSS masking. So, if I were to
7:04
inspect element on one of these, you'll
7:06
see there's a mask URL, which is just an
7:09
SVG of that shape and they go ahead and
7:13
make a mask of it. So, if we turn those
7:15
off, you see it's just a regular square,
7:17
and then by adding it, it just simply
7:20
just punches those values out. The
7:22
helmets are done in very much the same
7:24
way. However, there are several
7:26
different masks. And then this little
7:28
animation that is done here when you
7:31
hover over top of it uses a clip path
7:34
mask instead of an explicit SVG file
7:37
mask. So here we go. Clip path ellipse.
7:40
And then you hover over top of it and
7:42
the ellipse will simply just grow and
7:44
mask off the image that's on top of it.
Text Effects
7:46
For text effects, there's this really
7:48
cool effect when you hover over top of
7:49
these elements and the text will go up
7:53
and down. This is just a regular CSS
7:55
transition where the each single letter
7:59
is wrapped in a span and they animate
8:01
up. In fact, we did coming up on the
8:03
syntax YouTube channel. Make sure you
8:05
subscribe um implement our own version
8:07
of this. So basically we just wrap every
8:09
single letter in a span and then we
8:12
transition the uh or so we transition
8:15
the transform value up 100% and then we
8:19
put a transition delay on every single
8:21
letter that increases by I don't know
8:23
0.1 milliseconds or something like that
8:26
every single time you hover over top of
8:27
it. Pretty cool little effect. I love
8:30
seeing that on websites. Transitioning
Page Transitions
8:32
from page to page is actually really
8:34
cool. So when I click on one of these,
8:36
you'll see
8:38
let's let me show you that again. That's
8:40
really cool. So it just throws up this
8:41
whole screen loader and then in the
8:44
background it loads the page and then it
8:47
will mask out that loader on its way out
8:50
so you can see the new page in there. I
8:52
love that effect. I think we're going to
8:54
have to build that one as well. Um,
8:56
unfortunately, this is not using the
8:58
page transition API and it's simply just
9:02
when you click on a link, it's going to
9:04
load everything in the background and
9:06
it's going to swap out as it puts up
9:08
that curtain, it's swapping out the
9:11
document um, HTML and then once it's
9:14
done, it will animate itself back on
9:16
out. And you can see in the dev tools
9:18
here, page uh, page start, page
9:21
transition, and it shows how long it
9:22
takes to transition from page to page.
9:24
I'm assuming there's some sort of
9:26
timeout in there as well should it take
9:28
too long. But there's no React
9:30
framework, nothing like that in here.
9:32
It's simply just a bunch of vanilla
9:33
JavaScript and what we saw earlier, a
9:36
little bit of jQuery for that animation.
Custom Drawn Animations
9:38
When we head over to this on the track
9:39
page here, you'll see that there's these
9:42
like little cool every single race that
9:44
he has, there's a track and it's just
9:46
being highlighted over and over again.
9:48
So, I was like looking like how are they
9:50
how are they doing that? You know, is
9:51
that a video file? It's actually done in
9:55
3D canvas, but it was designed with a
9:58
tool called Rive. Um, and I guess Rive
10:02
is I'm not familiar with this, but Rive
10:04
is a 3D design tool that will allow you
10:09
to export your designs and interactions
10:12
to multiple platforms. One of those
10:14
platforms being done in Wom um, which
10:18
can then be piped into a 3D canvas. So I
10:22
downloaded the riv binaries. So they
10:25
compile to these binaries and I ran them
10:28
on this riv. website and you can see
10:31
that like this is this is one circuits.
10:35
Or circuits.
10:37
And you can just change between all the
10:39
different tracks but then there's also
10:41
like these different states. Hover off,
10:43
hover on, you can change Miami.
10:47
Um, there's some pretty cool stuff in
10:49
here. And all the nifty animations on
10:53
here, like this one as well. These
10:55
little I don't know what you call these.
10:57
These little flowers that pop up over
10:59
the NASCAR helmet. They are also done in
11:02
this this riv format. So, it's just like
11:06
I guess a way to design in a 3D program
11:09
and get them onto your website. On the
Signature Draw
11:11
homepage, his signature is also done
11:14
like that as well. So I'm normally I
11:17
would do this with like an SVG and then
11:20
you will do like an offset path on the
11:23
SVG but in this case they are simply
11:26
just painting it in depending on how far
11:28
in you are scrolled and you can kind of
11:31
scrub it back and forth with your scroll
Performance
11:33
wheel. Now let's talk about performance.
11:36
Normally websites like these are a
11:39
little bit chuggy. And normally, I'm
11:42
sure there's a bunch of people in the
11:43
comments right now being like, "What a
11:45
waste of CPU space. I can hardly it
11:48
freezes my Android from 40 years ago."
11:51
These kind types of websites are
11:53
generally pretty aggressive on using
11:56
system resources. So, I was like, "This
11:59
actually feels kind of buttery. Pretty
12:01
feels pretty good." It's maybe one of
12:03
the best feeling websites I've seen that
12:05
are just so over the top like this. So,
12:08
if you go into your dev tools and you
12:10
open up and you type FPS, you can open
12:12
up a frames per second meter and then
12:14
you just scroll the website and it will
12:17
tell you how many frames a second you're
12:18
getting. This thing is getting it's
12:21
almost impossible to get it to drop a
12:23
frame. You know, maybe if we do
12:25
something like like switch the pages,
12:28
you'll see a couple There we go. You see
12:29
a couple drop frames as it was doing
12:31
that initial render. That's usually
12:33
pretty normal. But like this whole
12:35
thing, I'm just crazy scrolling all over
12:38
it and I'm unable to get it to drop a
12:40
frame. Granted, I have a pretty fast M1
12:43
Mac computer, but that's pretty rare for
12:46
me to see a website like this that does
12:48
not drop frames like that and and
12:50
maintains to be so buttery. Now, how did
12:53
they do this, right? I think it's it's a
12:55
couple reason. First of all, there's no
12:57
drop shadows on anything. I used to
13:00
throw drop shadows on everything and
13:02
that it overlaps things and it it gets
13:04
expensive to calculate those because you
13:06
have to calculate what is behind it.
13:08
This is a very flat design. Um there's
13:10
not a lot of filters, not a lot of
13:12
blurring, not a lot of gradients, not a
13:14
lot of position absolute. They try to
13:17
stay away from a lot of that. Most of
13:19
the animations that I see them do are
13:22
done with just straight up transform,
13:24
which is the best thing you can do for
13:25
performance when you're doing
13:26
animations. if you're animating like a
13:29
font size or you're trying to animate
13:31
like top left, bottom right, those
13:34
things can start getting a little bit
13:35
chuggy. So, if you can keep everything
13:37
to just using straight up transforms,
13:40
you're usually going to be in pretty
13:42
good shape. And this is a very good
13:43
example of that. Now, Easter eggs,
Easter Eggs
13:46
couple cool things. First of all, dev
13:49
tools, look at the console log. Get
13:51
ready for it. Get ready for it. Boom.
13:54
Lando Norris in the console log. You can
13:57
actually color your console logs if you
13:59
want to. You just click through to that.
14:01
You can see in here the console log, you
14:04
do percent C and then everywhere you
14:07
want to color change and then you pass
14:09
the color as the second argument along
14:11
with the the actual font and font
14:14
weight. I thought that was a pretty neat
14:16
Easter egg. The loader itself says load
14:19
Norris, which I thought was a nice
14:21
little hat tip. It's obviously the
14:22
designers of this spent quite a bit of
14:24
time. Lastly, the very coolest thing, go
14:26
to the website and hit your F1