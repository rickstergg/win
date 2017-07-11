<?php
	// http://php.net/manual/en/reserved.variables.httpresponseheader.php#117203
	// Original solution modified to return the response code only and a 200 by default if nothing exists.
  function getResponseCodeFromHeaders( $headers )
	{
		$head = array();
		foreach( $headers as $k=>$v )
		{
			$t = explode( ':', $v, 2 );
			if( isset( $t[1] ) )
				$head[ trim($t[0]) ] = trim( $t[1] );
			else
			{
				$head[] = $v;
				if( preg_match( "#HTTP/[0-9\.]+\s+([0-9]+)#",$v, $out ) )
					return intval($out[1]);
			}
		}
		// If we couldn't find a code, something is wrong, return something scary-error level.
		return 500;
	}
  header('Content-Type: application/json');
  $url = $_POST['url'];
  $riot_api_response = file_get_contents($url.'api_key=0481fc25-e803-4cbb-9ba5-02ca7c391b96');
  $result = json_decode($riot_api_response, true);
  $result['response'] = getResponseCodeFromHeaders($http_response_header);
  print_r(json_encode($result));
?>
