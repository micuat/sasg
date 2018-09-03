using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LightLFO : MonoBehaviour {
    public Light light0;
    void Start()
    {
        //light0.color = Color.blue;
    }

    // Update is called once per frame
	void Update () {
        light0.transform.eulerAngles = new Vector3(light0.transform.eulerAngles.x,
                                                   -90 + 30 * Mathf.Sin(Time.time),
                                                   light0.transform.eulerAngles.z);
	}
}
