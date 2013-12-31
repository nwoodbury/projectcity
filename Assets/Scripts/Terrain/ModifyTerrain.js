#pragma strict

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Public Variables
//000000000000000000000000000000000000000000000000000000000000000000000000000000

var LoadChunkDistance : int = 32;
var UnloadChunkDistance : int = 48;

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Private Variables
//000000000000000000000000000000000000000000000000000000000000000000000000000000

private var TheWorld : World;
private var CameraGameObject : GameObject;

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Game Loop
//000000000000000000000000000000000000000000000000000000000000000000000000000000

function Start () 
{
	TheWorld = gameObject.GetComponent(World);
	CameraGameObject = GameObject.FindGameObjectWithTag('MainCamera');
}

function Update () 
{	
	LoadChunks(GameObject.FindGameObjectWithTag('Player').transform.position,
			   LoadChunkDistance, 
			   UnloadChunkDistance);

	if(Input.GetMouseButtonDown(0))
	{
		ReplaceBlockCursor(0);
	}
	
	if(Input.GetMouseButtonDown(1))
	{
		AddBlockCursor(1);
	}
}

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Helpers
//000000000000000000000000000000000000000000000000000000000000000000000000000000

function LoadChunks(playerPos : Vector3, distToLoad : float, 
					distToUnload : float)
{
	for (var x : int = 0; x < TheWorld.Chunks.GetLength(0); x++)
	{
		for (var z : int = 0; z < TheWorld.Chunks.GetLength(2); z++)
		{
			var orig : Vector2 = Vector2(x * TheWorld.ChunkSize, 
										 z * TheWorld.ChunkSize);
			var dest : Vector2 = Vector2(playerPos.x, playerPos.z);
			var dist : float = Vector2.Distance(orig, dest);
			
			if (dist < distToLoad && TheWorld.Chunks[x, 0, z] == null)
			{
				TheWorld.GenerateColumn(x, z);
			}
			if (dist > distToLoad && TheWorld.Chunks[x, 0, z] != null)
			{
				TheWorld.UnloadColumn(x, z);
			}
		}
	}
}

function ReplaceBlockCenter(range : float, block : byte)
{
	//Replaces the block directly in front of the player
	
	var ray : Ray = new Ray(CameraGameObject.transform.position,
							CameraGameObject.transform.forward);
	var hit : RaycastHit;
	
	if (Physics.Raycast(ray, hit)) {
		if (hit.distance < range)
		{
			ReplaceBlockAt(hit, block);
		}
	}
}

function AddBlockCenter(range : float, block : byte)
{
	//Adds the block specified directly in front of the player
	
	var ray : Ray = new Ray(CameraGameObject.transform.position,
	CameraGameObject.transform.forward);
	var hit : RaycastHit;
	
	if (Physics.Raycast(ray, hit)) {
		if (hit.distance < range)
		{
			AddBlockAt(hit, block);
		}
	}
}
 
function ReplaceBlockCursor(block : byte)
{
	//Replaces the block specified where the mouse cursor is pointing
	
	var ray : Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	var hit : RaycastHit;
	
	if (Physics.Raycast(ray, hit)) {
		ReplaceBlockAt(hit, block);
		Debug.DrawLine(ray.origin, ray.origin + ray.direction * hit.distance,
					   Color.green, 2);
	}
}

function AddBlockCursor(block : byte)
{
	//Adds the block specified where the mouse cursor is pointing
	
	var ray : Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	var hit : RaycastHit;
	
	if (Physics.Raycast(ray, hit)) {
		AddBlockAt(hit, block);
		Debug.DrawLine(ray.origin, ray.origin + ray.direction * hit.distance,
					   Color.green, 2);
	}
}
 
function ReplaceBlockAt(hit : RaycastHit, block : byte)
{
	//removes a block at these impact coordinates, you can raycast against the 
	//terrain and call this with the hit.point
	
	var position : Vector3 = hit.point;
	position += (hit.normal * -0.5);
	
	SetBlockAt(position, block);
}
 
function AddBlockAt(hit : RaycastHit, block : byte)
{
	//adds the specified block at these impact coordinates, you can raycast 
	//against the terrain and call this with the hit.point
	
	var position : Vector3 = hit.point;
	position += (hit.normal * 0.5);
	
	SetBlockAt(position, block);
}
 
function SetBlockAt(position : Vector3, block : byte)
{
	//sets the specified block at these coordinates
	
	var x : int = Mathf.RoundToInt(position.x);
	var y : int = Mathf.RoundToInt(position.y);
	var z : int = Mathf.RoundToInt(position.z);
	
	SetBlockAt(x, y, z, block);	
}

function SetBlockAt(x : int, y : int, z : int, block : byte)
{
	Debug.Log('Adding: ' + x + ', ' + y + ', ' + z);
	
	TheWorld.Data[x, y, z] = block;
	UpdateChunkAt(x, y, z);
}
 
function UpdateChunkAt(x : int, y : int, z : int)
{
	//Updates the chunk containing this block
	
	var UpdateX = Mathf.FloorToInt(x / TheWorld.ChunkSize);
	var UpdateY = Mathf.FloorToInt(y / TheWorld.ChunkSize);
	var UpdateZ = Mathf.FloorToInt(z / TheWorld.ChunkSize);
	
	Debug.Log('Updating: ' + UpdateX + ', ' + UpdateY + ', ' + UpdateZ);
	TheWorld.Chunks[UpdateX, UpdateY, UpdateZ].ShouldUpdate = true;
	
	if (x - TheWorld.ChunkSize * UpdateX == 0 && UpdateX != 0)
	{
		TheWorld.Chunks[UpdateX - 1, UpdateY, UpdateZ].ShouldUpdate = true;
	}
	
	if (x - TheWorld.ChunkSize * UpdateX == 15 && 
	    UpdateX != TheWorld.Chunks.GetLength(0) - 1)
	{
		TheWorld.Chunks[UpdateX + 1, UpdateY, UpdateZ].ShouldUpdate = true;
	}
	
	if (y - TheWorld.ChunkSize * UpdateY == 0 && UpdateY != 0)
	{
		TheWorld.Chunks[UpdateX, UpdateY - 1, UpdateZ].ShouldUpdate = true;
	}
	
	if (y - TheWorld.ChunkSize * UpdateY == 15 && 
		UpdateY != TheWorld.Chunks.GetLength(1) - 1)
	{
		TheWorld.Chunks[UpdateX, UpdateY + 1, UpdateZ].ShouldUpdate = true;
	}	
	
	if (z - TheWorld.ChunkSize * UpdateZ == 0 && UpdateZ != 0)
	{
		TheWorld.Chunks[UpdateX, UpdateY, UpdateZ - 1].ShouldUpdate = true;
	}
	
	if (z - TheWorld.ChunkSize * UpdateZ == 15 && 
		UpdateZ != TheWorld.Chunks.GetLength(2) - 1)
	{
		TheWorld.Chunks[UpdateX, UpdateY, UpdateZ + 1].ShouldUpdate = true;
	}	
}