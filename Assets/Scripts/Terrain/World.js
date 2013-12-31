#pragma strict
import System.Collections.Generic;

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Public Variables
//000000000000000000000000000000000000000000000000000000000000000000000000000000

public var WorldX : int = 16;
public var WorldY : int = 16;
public var WorldZ : int = 16;

public var ChunkGameObject : GameObject;
public var Chunks : Chunk[,,];
public var ChunkSize : int = 16;

var Data : byte[,,];

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Private Variables
//000000000000000000000000000000000000000000000000000000000000000000000000000000



//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Game Loop
//000000000000000000000000000000000000000000000000000000000000000000000000000000

function Start() 
{
	// Initialize Data
	Data = new byte[WorldX, WorldY, WorldZ];	
	for (var x : int = 0; x < WorldX; x++)
	{
		for (var z: int = 0; z < WorldZ; z++)
		{
			var stone : int = PerlinNoise(x, 0, z, 10, 3, 1.2);
			stone += PerlinNoise(x, 300, z, 20, 4, 0);
			stone += PerlinNoise(x, 150, z, 15, 3, 1.5);
			stone += 24;
			
			var dirt : int = PerlinNoise(x, 100, z, 50, 2, 0) + stone + 1;
			
			for (var y : int = 0; y < WorldY; y++)
			{
				if (y <= stone)
				{
					Data[x, y, z] = 1;
				}
				else if(y <= dirt)
				{
					Data[x, y, z] = 2;
				}
				else
				{
					Data[x, y, z] = 0;
				}
			}
		}
	}	
		
	// Initialize Chunks
	Chunks = new Chunk[Mathf.FloorToInt(WorldX / ChunkSize),
					   Mathf.FloorToInt(WorldY / ChunkSize),
					   Mathf.FloorToInt(WorldZ / ChunkSize)];
}

function Update() 
{
	
}

//000000000000000000000000000000000000000000000000000000000000000000000000000000
//	Helpers
//000000000000000000000000000000000000000000000000000000000000000000000000000000

//-------------------------------------
//	Data Access
//-------------------------------------

function Block(x : int, y : int, z : int)
{
	var block : byte;
	if (x >= WorldX || x < 0 
		|| y >= WorldY || y < 0
		|| z >= WorldZ || z < 0)
	{
		
		block = 1;
	}
	else
	{
		block = Data[x, y, z];
	}
	
	return block;
}

//-------------------------------------
//	Chunk Loading
//-------------------------------------

function GenerateColumn(x : int, z : int)
{
	for (var y : int = 0; y < Chunks.GetLength(1); y++)
	{
		var ChunkLocation = Vector3(x * ChunkSize - 0.5,
									y * ChunkSize + 0.5,
									z * ChunkSize - 0.5);
		var NewChunk : GameObject = Instantiate(ChunkGameObject,
												ChunkLocation,
												Quaternion(0, 0, 0, 0));
												
		NewChunk.transform.parent = gameObject.transform;
												
		Chunks[x, y, z] = NewChunk.GetComponent(Chunk);
		Chunks[x, y, z].WorldGameObject = gameObject;
		Chunks[x, y, z].ChunkSize = ChunkSize;
		Chunks[x, y, z].ChunkX = x * ChunkSize;
		Chunks[x, y, z].ChunkY = y * ChunkSize;
		Chunks[x, y, z].ChunkZ = z * ChunkSize;
	}
}

function UnloadColumn(x : int, z : int)
{
	for (var y : int = 0; y < Chunks.GetLength(1); y++)
	{
		Destroy(Chunks[x, y, z].gameObject);
	}	
}

//-------------------------------------
//	Noise
//-------------------------------------

function PerlinNoise(x : int, y : int, z : int, scale : float, height : float,
					 power : float)
{
	var RValue : float;
	
	var sx : double = x / scale;
	var sy : double = y / scale;
	var sz : double = z / scale;
		
	RValue = Noise.GetNoise(sx, sy, sz) * height;
	
	if (power != 0)
	{
		RValue = Mathf.Pow(RValue, power);
	}
	
	var R2Value : int = RValue;
	return R2Value;
}