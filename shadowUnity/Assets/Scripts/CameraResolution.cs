using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Skrypt odpowiada za usatwienie rozdzielczosci kemerze
/// </summary>
public class CameraResolution : MonoBehaviour
{
    public Camera cam;
    // Use this for initialization
    void Start()
    {
        cam.aspect = 4.0f;
    }

    // Update is called once per frame
    void Update()
    {
    }
}