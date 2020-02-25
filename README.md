summary:
eggine2d uses pixijs to display graphics and uses a networking solution developed by me in order to facilitate multiplayer play. the main feature of the eggine is its networking features, which allows me to easily program new content for the game without having to worry about various networking factors.

---

### PIXIJS features:  
PIXIJS is a very versatile graphics library that provides many rendering functions, primarily dealing with 2D sprites/objects. most importantly, the PIXIJS library allows users to access the "barebones" OpenGL state if needed by the user, which i have used to implement a lighting engine.  

the eggine uses this library to render its graphics to a few different layers:
- the static layer, rendered ontop of everything and unmovable
- the dynamic layer, rendered below the static layer and moves along with a camera object
- the lighting layer, rendered ontop of the dynamic layer and moves along with the camera object. a shadow mask layer is used to determine whether or not a portion of the screen is under shadow, and light is not rendered in this region

using these layers, i can render whatever i want. if i am working on a game that requires more layers, then i am easily able to implement them and add them to the already existing layers.  

additionally, the renderer has a custom chunking system that reduces the load on PIXIJS for rendering. basically, this functions as frustum culling. the world is broken into an infinite amount of chunks of a discrete size. objects are grouped into these chunks, and when a chunk is not seen on the camera the chunk is forcibily not rendered.  

### Networking features:
the networking has been inspired by how the Unreal Engine has implemented its networking features. the goal with networking is to clone an entire game state from server to client. in order to do this, we need to send a perfect copy of every object that makes up this game state to the client. every object that contributes to this game state is called a Remote Object, because it will inevitably be sent remotely over the network to the client. Remote Objects each have an unique ID that is used by the server and client to reference a cloned object. the unique ID allows the network to optimize a few things required for additional features. such features include:
- remote methods which can be executed by the client on the server or vice versa. remote methods are inherintly dangerous, since the client can send bogus information to a method, or even spoof the method that they want to execute. this is mitigated by having a whitelist of allowed remote methods and a parameter verification system that checks the types of parameters sent by the client. the verification system also can check the range of such parameters, throwing out parameters that are of the correct type but are still unexpected by the remote method. remote methods are integrated in such a way that allows the programmer to call any method that has been marked as a remote one, reducing code complexity. a Typescript Decorator will automatically determine to request the server or client to execute the remote method
- remote returns allow data to be automatically forwarded to the client or server after a remote method is executed. this feature is experimental right now, but eventually i want to be able to simply access a remote return as you would access a normal method's return. a remote return works by creating a promise that is resolved once data from the other end of the network has been received. the promise can simply be ```await```ed to access the value of the remote return