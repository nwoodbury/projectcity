#pragma strict
import System.Collections.Generic;

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Public Variables
//000000000000000000000000000000000000000000000000000000000000000000000000000000

// World
var WorldGameObject : GameObject;

// Chunks
var ChunkSize : int;
var ChunkX : int;
var ChunkY : int;
var ChunkZ : int;

// Block Details
var BlockDefinitions : BlockDetails[] = new BlockDetails[3];

// Update
var ShouldUpdate : boolean = false;

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Private Variables
//000000000000000000000000000000000000000000000000000000000000000000000000000000

// World
private var GameWorld : World;

// Mesh
private var NewVertices : List.<Vector3> = new List.<Vector3>();
private var NewTriangles : List.<int> = new List.<int>();
private var NewUV : List.<Vector2> = new List.<Vector2>();
private var NewMesh : Mesh; 
private var FaceCount : int;

// Texture
private var TUnit : float = 0.125;
private var TStone : Vector2 = new Vector2(1, 15);
private var TGrass : Vector2 = new Vector2(0, 15);

// Collider
private var Collider : MeshCollider;

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Game Loop
//000000000000000000000000000000000000000000000000000000000000000000000000000000

function Start() 
{
	NewMesh = gameObject.GetComponent(MeshFilter).mesh;
	Collider = gameObject.GetComponent(MeshCollider);
	
	GameWorld = WorldGameObject.GetComponent(World);
	
	GenerateMesh();
}

function Update() 
{
	
}

function LateUpdate()
{
	if (ShouldUpdate)
	{
		GenerateMesh();
		ShouldUpdate = false;
	}
}

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Helpers
//000000000000000000000000000000000000000000000000000000000000000000000000000000

//-------------------------------------
//	Mesh Generate and Update
//-------------------------------------

function GenerateMesh()
{
	for (var x : int = 0; x < ChunkSize; x++)
	{
		for (var y : int = 0; y < ChunkSize; y++)
		{
			for (var z : int = 0; z < ChunkSize; z++)
			{
				BuildCube(x, y, z);
			}
		}
	}
	UpdateMesh();
}

function UpdateMesh()
{
	NewMesh.Clear();
	NewMesh.vertices = NewVertices.ToArray();
	NewMesh.uv = NewUV.ToArray();
	NewMesh.triangles = NewTriangles.ToArray();
	NewMesh.Optimize();
	NewMesh.RecalculateNormals();
		
	Collider.sharedMesh = null;
	Collider.sharedMesh = NewMesh;
	
	NewVertices.Clear();
	NewUV.Clear();
	NewTriangles.Clear();
	
	FaceCount = 0;
}

//-------------------------------------
//	Data Access
//-------------------------------------

function Block(x : int, y : int, z : int)
{
	return GameWorld.Block(x + ChunkX, y + ChunkY, z + ChunkZ);
}

//-------------------------------------
//	Mesh Initialization
//-------------------------------------

function BuildCube(x : int, y : int, z : int)
{
	var block : byte = Block(x, y, z);
		
	if (block == 0)
	{
		// Don't draw anything
		return;
	}
	
	var details = BlockDefinitions[block];
	var texture : Vector2;
	
	if (Block(x, y + 1, z) == 0)
	{
		texture = details.TopTexture;
		CubeTop(x, y, z, texture);
	}
	
	if (Block(x, y - 1, z) == 0)
	{
		texture = details.BottomTexture;
		CubeBottom(x, y, z, texture);
	}
	
	if (Block(x, y, z + 1) == 0)
	{
		texture = details.SideTexture;
		CubeNorth(x, y, z, texture);
	}
	
	if (Block(x, y, z - 1) == 0)
	{
		texture = details.SideTexture;
		CubeSouth(x, y, z, texture);
	}
		
	if (Block(x + 1, y, z) == 0)
	{
		texture = details.SideTexture;
		CubeEast(x, y, z, texture);	
	}
	
	if (Block(x - 1, y, z) == 0)
	{
		texture = details.SideTexture;
		CubeWest(x, y, z, texture);	
	}	
}

function CubeTop(x : int, y : int, z : int, texture : Vector2)
{
	NewVertices.Add(Vector3(x, y, z + 1));
	NewVertices.Add(Vector3(x + 1, y, z + 1));
	NewVertices.Add(Vector3(x + 1, y, z));
	NewVertices.Add(Vector3(x, y, z));
	
	Cube(texture);
}

function CubeNorth(x : int, y : int, z : int, texture : Vector2)
{
	NewVertices.Add(Vector3(x + 1, y - 1, z + 1));
	NewVertices.Add(Vector3(x + 1, y, z + 1));
	NewVertices.Add(Vector3(x, y, z + 1));
	NewVertices.Add(Vector3(x, y - 1, z + 1));
	
	Cube(texture);
}

function CubeEast(x : int, y : int, z : int, texture : Vector2)
{
	NewVertices.Add(Vector3(x + 1, y - 1, z));
	NewVertices.Add(Vector3(x + 1, y, z));
	NewVertices.Add(Vector3(x + 1, y, z + 1));
	NewVertices.Add(Vector3(x + 1, y - 1, z + 1));
	
	Cube(texture);
}
function CubeSouth(x : int, y : int, z : int, texture : Vector2)
{
	NewVertices.Add(Vector3(x, y - 1, z));
	NewVertices.Add(Vector3(x, y, z));
	NewVertices.Add(Vector3(x + 1, y, z));
	NewVertices.Add(Vector3(x + 1, y - 1, z));
	
	Cube(texture);
}

function CubeWest(x : int, y : int, z : int, texture : Vector2)
{
	NewVertices.Add(Vector3(x, y - 1, z + 1));
	NewVertices.Add(Vector3(x, y, z + 1));
	NewVertices.Add(Vector3(x, y, z));
	NewVertices.Add(Vector3(x, y - 1, z));
	
	Cube(texture);
} 

function CubeBottom(x : int, y : int, z : int, texture : Vector2)
{
	NewVertices.Add(Vector3(x, y - 1, z));
	NewVertices.Add(Vector3(x + 1, y - 1, z));
	NewVertices.Add(Vector3(x + 1, y - 1, z + 1));
	NewVertices.Add(Vector3(x, y - 1, z + 1));
	
	Cube(texture);
}

function Cube(TexturePos : Vector2)
{
	var offset = FaceCount * 4;
	NewTriangles.Add(offset + 0);
	NewTriangles.Add(offset + 1);
	NewTriangles.Add(offset + 2);
	NewTriangles.Add(offset + 0);
	NewTriangles.Add(offset + 2);
	NewTriangles.Add(offset + 3);
		
	NewUV.Add(Vector2(TUnit * TexturePos.x + TUnit, 
					  TUnit * TexturePos.y));
	NewUV.Add(Vector2(TUnit * TexturePos.x + TUnit, 
					  TUnit * TexturePos.y  + TUnit));
	NewUV.Add(Vector2(TUnit * TexturePos.x, 
					  TUnit * TexturePos.y  + TUnit));
	NewUV.Add(Vector2(TUnit * TexturePos.x , 
					  TUnit * TexturePos.y));
	
	FaceCount ++;
}

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Block Details
//000000000000000000000000000000000000000000000000000000000000000000000000000000

class BlockDetails
{
	var Name : String;
	var TopTexture : Vector2;
	var SideTexture : Vector2;
	var BottomTexture : Vector2;
}